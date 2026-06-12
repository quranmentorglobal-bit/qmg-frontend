// src/types/database.ts
export type UserRole      = 'student' | 'teacher' | 'admin'
export type TeacherStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected' | 'suspended'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type LessonStatus  = 'scheduled' | 'live' | 'completed' | 'cancelled' | 'no_show'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'
export type PaymentMethod = 'stripe' | 'jazzcash' | 'wallet'
export type CourseType    = 'Noorani Qaida' | 'Tajweed' | 'Hifz' | 'Tafseer' | 'Islamic Studies' | 'Ijazah'

export interface Profile {
  id:         string
  role:       UserRole
  first_name: string
  last_name:  string
  email:      string
  phone:      string | null
  country:    string | null
  timezone?:  string | null
  avatar_url: string | null
  bio:        string | null
  gender?:    string | null
  is_active:  boolean
  created_at: string
  updated_at: string
}

export interface TeacherProfile {
  id:                  string
  user_id:             string
  status:              TeacherStatus
  ijazah_verified:     boolean
  ijazah_document_url?: string | null
  years_experience:    number
  specializations:     string[]
  teaching_languages:  string[]
  hourly_rate_usd:     number
  trial_rate_usd:      number
  available_days:      string[]
  avg_rating:          number
  total_reviews:       number
  total_lessons:       number
  rejection_reason?:   string | null
  submitted_at?:       string | null
  profile_photo_url?:  string | null
  gender?:             string | null
  intro_video_url?:    string | null
  created_at:          string
  updated_at:          string
}

export interface Course {
  id:              string
  teacher_id:      string
  title:           string
  course_type:     string
  level:           string
  age_group:       string
  duration_mins:   number
  price_usd:       number
  trial_price_usd: number
  description:     string | null
  is_active:       boolean
  created_at:      string
  updated_at:      string
}

export interface Booking {
  id:           string
  student_id:   string
  teacher_id:   string
  course_id:    string | null
  status:       BookingStatus
  start_date:   string
  session_time: string
  recurrence:   string
  price_usd:    number
  is_trial:     boolean
  notes:        string | null
  created_at:   string
  updated_at:   string
}

export interface Lesson {
  id:              string
  booking_id:      string
  student_id:      string
  teacher_id:      string
  status:          LessonStatus
  scheduled_at:    string
  duration_mins:   number
  daily_room_url:  string | null
  teacher_notes:   string | null
  completed_at:    string | null
  created_at:      string
  updated_at:      string
}

export interface Review {
  id:           string
  student_id:   string
  teacher_id:   string
  lesson_id:    string | null
  rating:       number
  title:        string | null
  body:         string | null
  is_published: boolean
  created_at:   string
}

export interface Payment {
  id:                  string
  student_id:          string
  teacher_id:          string
  booking_id:          string | null
  lesson_id:           string | null
  status:              PaymentStatus
  payment_method:      PaymentMethod | null
  stripe_payment_id:   string | null
  gross_amount_usd:    number
  platform_fee_usd:    number
  teacher_payout_usd:  number
  currency:            string
  created_at:          string
  updated_at:          string
}

export interface PublicTeacher {
  id:                string
  first_name:        string
  last_name:         string
  avatar_url:        string | null
  country:           string | null
  bio:               string | null
  years_experience:  number
  specializations:   CourseType[]
  teaching_languages: string[]
  available_days:    string[]
  hourly_rate_usd:   number
  trial_rate_usd:    number
  ijazah_verified:   boolean
  avg_rating:        number | null
  total_reviews:     number
  total_lessons:     number
}

export interface StudentBookingView {
  id:               string
  status:           BookingStatus
  start_date:       string
  session_time:     string
  recurrence:       string
  price_usd:        number
  is_trial:         boolean
  created_at:       string
  duration_mins:    number
  teacher_id:       string
  teacher_name:     string
  teacher_avatar:   string | null
  course_title:     string
  course_type:      CourseType
}

export interface TeacherBookingView {
  id:               string
  status:           BookingStatus
  start_date:       string
  session_time:     string
  recurrence:       string
  price_usd:        number
  is_trial:         boolean
  created_at:       string
  duration_mins:    number
  student_id:       string
  student_name:     string
  student_avatar:   string | null
  course_title:     string
  course_type:      CourseType
}
