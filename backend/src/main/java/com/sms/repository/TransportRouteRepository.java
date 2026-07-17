package com.sms.repository;

import com.sms.entity.TransportRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TransportRouteRepository extends JpaRepository<TransportRoute, Long>, JpaSpecificationExecutor<TransportRoute> {
}
