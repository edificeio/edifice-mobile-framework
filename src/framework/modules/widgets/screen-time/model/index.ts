/**
 * Data model for the module screenTime
 */

// API Response Models
export interface ScreenTimeDayResponse {
  durations: ScreenTimeDuration[];
  totalDurationHours: number;
  totalDurationString: string;
}

export interface ScreenTimeDuration {
  hour: string; // Format: "00" to "23"
  durationMinutes: number;
  schoolUsePercentage: number; // 0-100
}

export interface ScreenTimeWeekResponse {
  dailySummaries: ScreenTimeDailySummary[];
  averageDurationHours: number;
  averageSchoolUsePercentage: number; // 0-100
  averageDurationString: string;
}

export interface ScreenTimeDailySummary {
  date: string; // Format: "YYYY-MM-DD"
  durationMinutes: number;
  schoolUsePercentage: number; // 0-100
}
