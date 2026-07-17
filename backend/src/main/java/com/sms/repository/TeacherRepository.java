package com.sms.repository;

import com.sms.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long>, JpaSpecificationExecutor<Teacher> {
    boolean existsByEmployeeId(String employeeId);
    boolean existsByEmail(String email);
    Optional<Teacher> findByEmployeeId(String employeeId);
    Optional<Teacher> findByEmail(String email);
}

