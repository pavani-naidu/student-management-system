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
public class NoticeDTO {
    private Long id;
    private String title;
    private String content;
    private LocalDate publishedDate;
    private String targetAudience;
    private String postedBy;
}
