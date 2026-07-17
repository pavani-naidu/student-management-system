package com.sms.repository;

import com.sms.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long>, JpaSpecificationExecutor<Attendance> {
    Optional<Attendance> findByStudentIdAndDate(Long studentId, LocalDate date);
    long countByStudentIdAndStatus(Long studentId, Attendance.Status status);
    long countByStudentId(Long studentId);
    List<Attendance> findByStudentIdOrderByDateDesc(Long studentId);
}
