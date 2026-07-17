package com.sms.dto;

import lombok.Data;
import java.util.List;

@Data
public class BulkMarkDTO {
    private Long examId;
    private List<Record> records;

    @Data
    public static class Record {
        private Long studentId;
        private Double obtainedMarks;
        private String remarks;
    }
}
