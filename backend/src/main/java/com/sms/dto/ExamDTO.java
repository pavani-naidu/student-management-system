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
public class ExamDTO {
    private Long id;
    private String name;
    private LocalDate date;
    private Long courseId;
    private String courseName;
    private Integer maxMarks;
    private Integer passingMarks;
}
