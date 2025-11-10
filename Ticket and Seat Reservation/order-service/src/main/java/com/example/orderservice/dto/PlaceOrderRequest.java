package com.example.orderservice.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public class PlaceOrderRequest {
    @NotNull
    public String userId;

    @NotEmpty
    public List<OrderLine> lines;

    public static class OrderLine {
    @NotNull public String eventId;
        @NotBlank public String seatCode;
        @NotNull public java.math.BigDecimal price;
    }
}
