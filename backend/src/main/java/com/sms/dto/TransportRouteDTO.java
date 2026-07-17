package com.sms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TransportRouteDTO {
    private Long id;

    @NotBlank(message = "Route name is required")
    private String routeName;

    private String vehicleNumber;
    private String driverName;
    private String driverMobile;
    private Double fee;
}
