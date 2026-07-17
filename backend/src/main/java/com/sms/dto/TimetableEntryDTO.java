package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableEntryDTO {
    private Long id;
    private Long courseId;
    private String courseName;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private String subject;
    private String teacherName;
    private String roomNumber;
}
