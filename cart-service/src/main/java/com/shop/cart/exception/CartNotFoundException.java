package com.shop.cart.exception;

import com.shop.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class CartNotFoundException extends BaseException {
    public CartNotFoundException(String message) {
        super("CART_NOT_FOUND", message, HttpStatus.NOT_FOUND);
    }
}
