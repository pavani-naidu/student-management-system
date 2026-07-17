package com.sms.dto;

import com.sms.entity.HostelAllocationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class HostelAllocationDTO {
    private Long id;

    @NotNull(message = "Room ID is required")
    private Long roomId;

    private String blockName;
    private String roomNumber;
    private String roomType;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private String studentRoll;
    private String studentName;

    @NotNull(message = "Allocation date is required")
    private LocalDate allocationDate;

    private HostelAllocationStatus status;
}
