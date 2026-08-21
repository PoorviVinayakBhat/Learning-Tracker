package com.learningtracker.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * A subject/category grouping resources, e.g. "DBMS", "System Design",
 * "Behavioral Interview". Used to compute the Knowledge Decay Radar per subject.
 */
@Entity
@Table(name = "topics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 500)
    private String description;

    // e.g. EXAM, INTERVIEW, WORK, GENERAL - drives revision planner behaviour
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Purpose purpose = Purpose.GENERAL;

    private LocalDateTime targetDate; // e.g. exam date / interview date

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private Set<Resource> resources = new HashSet<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Purpose {
        EXAM, INTERVIEW, WORK, GENERAL
    }
}
