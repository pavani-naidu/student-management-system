package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyFeesResponse {
    private Double totalPaid;
    private Double totalPending;
    private Double totalOutstanding;
    private List<FeePaymentDTO> history;
}
