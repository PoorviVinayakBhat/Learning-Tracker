package com.learningtracker.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * A single learning resource: a YouTube video, book, course, article, etc.
 * Holds raw notes/content, the AI generated summary, and the retention
 * metrics used by the Knowledge Decay Radar.
 */
@Entity
@Table(name = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    @Column(length = 1000)
    private String sourceUrl;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String rawContent; // notes / transcript / pasted text the user provides

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String aiSummary; // AI-generated summary, filled after summarization call

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.NOT_STARTED;

    // 0-100 mastery score, updated by quiz performance and manual review
    @Builder.Default
    private Double masteryScore = 0.0;

    // --- Knowledge Decay Radar fields ---
    private LocalDateTime lastReviewedAt;

    // Ebbinghaus-style forgetting curve strength; higher = retains longer.
    // Increases each time the resource is reviewed/quizzed successfully.
    @Builder.Default
    private Double retentionStrength = 1.0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    @JsonIgnore
    private Topic topic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum ResourceType {
        YOUTUBE_VIDEO, BOOK, COURSE, ARTICLE, PDF, OTHER
    }

    public enum Status {
        NOT_STARTED, IN_PROGRESS, COMPLETED
    }
}
