package com.sms.dto;

import com.sms.entity.Attendance;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AttendanceDTO {
    private Long id;
    private Long studentId;
    private String studentRollNumber;
    private String studentFirstName;
    private String studentLastName;
    private LocalDate date;
    private Attendance.Status status;
    private String remarks;
}
