package com.sms.repository;

import com.sms.entity.HostelRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;

public interface HostelRoomRepository extends JpaRepository<HostelRoom, Long>, JpaSpecificationExecutor<HostelRoom> {
    Optional<HostelRoom> findByBlockNameAndRoomNumber(String blockName, String roomNumber);
    boolean existsByBlockNameAndRoomNumber(String blockName, String roomNumber);
}
