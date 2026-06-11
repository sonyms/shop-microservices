package com.shop.cart.service;

import com.shop.common.dto.CartDto;
import com.shop.common.dto.CartItemDto;
import com.shop.cart.model.Cart;
import com.shop.cart.model.CartItem;
import com.shop.cart.repository.CartRepository;
import com.shop.clients.feign.ProductClient;
import org.springframework.stereotype.Service;

import java.util.Optional;
import com.shop.common.dto.ProductResponseDto;
import com.shop.common.exception.ResourceNotFoundException;
import feign.FeignException;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductClient productClient;

    public CartServiceImpl(CartRepository cartRepository, ProductClient productClient) {
        this.cartRepository = cartRepository;
        this.productClient = productClient;
    }

    public CartDto getCart(String userId) {
        Cart cart = cartRepository.findById(userId).orElse(new Cart(userId));
        return mapToDto(cart);
    }

    public CartDto addToCart(String userId, CartItemDto itemDto) {
        CartItem item = new CartItem();
        item.setProductId(itemDto.getProductId());
        item.setQuantity(itemDto.getQuantity());

        try {
            ProductResponseDto product = productClient.getProduct(item.getProductId()).getBody().getData();
            item.setName(product.getName());
            item.setPrice(product.getPrice());
        } catch (FeignException.NotFound e) {
            throw new ResourceNotFoundException("Product", item.getProductId());
        }

        Cart cart = cartRepository.findById(userId).orElse(new Cart(userId));
        
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(item.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + item.getQuantity());
        } else {
            cart.getItems().add(item);
        }

        Cart saved = cartRepository.save(cart);
        return mapToDto(saved);
    }

    public CartDto removeFromCart(String userId, Long productId) {
        Cart cart = cartRepository.findById(userId).orElse(new Cart(userId));
        cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        Cart saved = cartRepository.save(cart);
        return mapToDto(saved);
    }

    public void clearCart(String userId) {
        cartRepository.deleteById(userId);
    }

    private CartDto mapToDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getUserId());
        dto.setItems(cart.getItems().stream().map(i -> {
            CartItemDto itemDto = new CartItemDto();
            itemDto.setProductId(i.getProductId());
            itemDto.setQuantity(i.getQuantity());
            itemDto.setName(i.getName());
            itemDto.setPrice(i.getPrice());
            return itemDto;
        }).toList());
        return dto;
    }
}
