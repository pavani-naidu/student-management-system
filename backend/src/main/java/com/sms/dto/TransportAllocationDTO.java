package com.sms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TransportAllocationDTO {
    private Long id;

    @NotNull(message = "Route ID is required")
    private Long routeId;

    private String routeName;
    private String vehicleNumber;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private String studentRoll;
    private String studentName;

    private String pickupPoint;
    private LocalDate allocationDate;
}
