package com.sms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "transport_routes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransportRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String routeName;

    private String vehicleNumber;

    private String driverName;

    private String driverMobile;

    private Double fee;
}
