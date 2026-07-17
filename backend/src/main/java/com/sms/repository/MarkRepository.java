package com.sms.repository;

import com.sms.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;
import java.util.Optional;

public interface MarkRepository extends JpaRepository<Mark, Long>, JpaSpecificationExecutor<Mark> {
    Optional<Mark> findByStudentIdAndExamId(Long studentId, Long examId);
    List<Mark> findByStudentId(Long studentId);
    List<Mark> findByExamId(Long examId);
}
