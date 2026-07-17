package com.sms.repository;

import com.sms.entity.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<TimetableEntry, Long> {
    List<TimetableEntry> findByCourseId(Long courseId);
    List<TimetableEntry> findByCourseIdOrderByDayOfWeekAscStartTimeAsc(Long courseId);
}
