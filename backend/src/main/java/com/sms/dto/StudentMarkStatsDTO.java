package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentMarkStatsDTO {
    private Double averagePercentage;
    private Double gpa;
    private Integer examsCleared;
    private Integer totalExams;
    private Double highestMark;
}
