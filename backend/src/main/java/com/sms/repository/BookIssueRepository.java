package com.sms.repository;

import com.sms.entity.BookIssue;
import com.sms.entity.BookIssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface BookIssueRepository extends JpaRepository<BookIssue, Long>, JpaSpecificationExecutor<BookIssue> {
    List<BookIssue> findByStudentId(Long studentId);
    List<BookIssue> findByStudentUserEmail(String email);
    List<BookIssue> findByStatus(BookIssueStatus status);
}
