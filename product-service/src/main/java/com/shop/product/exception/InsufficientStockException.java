package com.shop.product.exception;

import com.shop.common.exception.BaseException;
import org.springframework.http.HttpStatus;

public class InsufficientStockException extends BaseException {
    public InsufficientStockException(String message) {
        super("INSUFFICIENT_STOCK", message, HttpStatus.BAD_REQUEST);
    }
}
