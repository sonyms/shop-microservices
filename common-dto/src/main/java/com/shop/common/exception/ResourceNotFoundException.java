package com.shop.common.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends BaseException {

    public ResourceNotFoundException(String resource) {
        super("NOT_FOUND", resource + " not found", HttpStatus.NOT_FOUND);
    }

    public ResourceNotFoundException(String resource, Object id) {
        super("NOT_FOUND", resource + " with id '" + id + "' not found", HttpStatus.NOT_FOUND);
    }
}
