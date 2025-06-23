class Api::V1::DashboardController < ApplicationController
  def stats
    render json: {
      success: true,
      data: {
        metrics: ::DashboardStatsService.calculate_main_metrics,
        trends: ::DashboardStatsService.calculate_trends,
        goals: ::DashboardStatsService.calculate_goals,
        alerts: ::DashboardStatsService.generate_alerts,
        recent_activity: ::DashboardStatsService.get_recent_activity
      }
    }
  end
end
