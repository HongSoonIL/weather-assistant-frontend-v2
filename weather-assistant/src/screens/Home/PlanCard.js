// src/screens/Home/PlanCard.js
import React from 'react';
import './Home.css';

const PlanCard = ({ schedule }) => {
  const {
    image,
    tag,
    title,
    subtitle,
    timeRange,
    etaText,
    body,
  } = schedule;

  return (
    <div className="plan-card">
      <img className="plan-card-image" src={image} alt={title} />

      <div className="plan-card-tag-row">
        <span className="plan-card-tag-pill">{tag}</span>
      </div>

      {/* 🔵 1줄: 제목 + 시간 */}
      <div className="plan-card-title-row">
        <h2 className="plan-card-title">{title}</h2>
        <span className="plan-card-time">{timeRange}</span>
      </div>

      {/* 🔵 2줄: 서브타이틀 + ETA */}
      <div className="plan-card-sub-row">
        <p className="plan-card-subtitle">{subtitle}</p>
        <span className="plan-card-time-eta">{etaText}</span>
      </div>

      <p className="plan-card-body">{body}</p>
    </div>
  );
};

export default PlanCard;
