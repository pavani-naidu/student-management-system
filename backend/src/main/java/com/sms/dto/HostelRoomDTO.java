package com.sms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HostelRoomDTO {
    private Long id;

    @NotBlank(message = "Block name is required")
    private String blockName;

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    private String roomType;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private Integer occupiedCount;
}
