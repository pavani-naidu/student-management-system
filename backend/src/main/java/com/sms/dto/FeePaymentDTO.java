package com.sms.dto;

import com.sms.entity.FeePayment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeePaymentDTO {
    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private String studentRollNumber;
    private String studentFirstName;
    private String studentLastName;

    @NotNull(message = "Amount is required")
    private Double amount;

    private LocalDate paymentDate;

    @NotBlank(message = "Fee type is required")
    private String feeType;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    @NotNull(message = "Status is required")
    private FeePayment.Status status;

    private String transactionId;
    private String remarks;
}
