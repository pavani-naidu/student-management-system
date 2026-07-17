package com.sms.repository;

import com.sms.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findByTargetAudienceInOrderByPublishedDateDesc(List<String> targetAudiences);
    List<Notice> findByOrderByPublishedDateDesc();
}
