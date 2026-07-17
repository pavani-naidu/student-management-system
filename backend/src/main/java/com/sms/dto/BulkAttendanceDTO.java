package com.sms.dto;

import com.sms.entity.Attendance;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class BulkAttendanceDTO {
    private LocalDate date;
    private List<Record> records;

    @Data
    public static class Record {
        private Long studentId;
        private Attendance.Status status;
        private String remarks;
    }
}
