package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarkDTO {
    private Long id;
    private Long studentId;
    private String studentRollNumber;
    private String studentFirstName;
    private String studentLastName;
    private Long examId;
    private String examName;
    private Integer examMaxMarks;
    private Integer examPassingMarks;
    private LocalDate examDate;
    private Double obtainedMarks;
    private String remarks;
    private Boolean passed;
}
