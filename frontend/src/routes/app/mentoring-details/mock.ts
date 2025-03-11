import type { GroupMentoringDetails } from '@/types/mentoring'

export const groupMentoringDetailsMock: GroupMentoringDetails = {
  id: 'group_001',
  title: 'Group Mentoring Schedule',
  price: 199.99,
  promotional_price: 149.99,
  qnt_students: 25,
  purchase_deadline: '2024-12-31T23:59:59Z',
  expiration_date: '2025-12-31T23:59:59Z',
  type: 'group', // ou "single"
  mentor_id: 'mentor_001',
  mentorship: {
    id: 'mentorship_001',
    title: 'Advanced Mentorship Program',
    image_url: 'https://example.com/images/mentorship.jpg',
    created_at: '2024-01-01T12:00:00Z',
    updated_at: '2024-06-01T12:00:00Z',
  },
  course: {
    id: 'course_001',
    title: 'Mastering Programming',
    price: 299.99,
    promotional_price: 199.99,
    qnt_class: 30,
    progress: 50,
    qnt_students: 50,
    image_url: 'https://example.com/images/course.jpg',
    is_pay: true,
    created_at: '2024-01-01T12:00:00Z',
    updated_at: '2024-06-01T12:00:00Z',
  },
  last_class: {
    id: 'class_001',
    module_id: 'module_001',
    title: 'Introduction to Programming',
    description: 'Learn the basics of programming in this introductory class.',
    views: 100,
    sequence: 1,
    pv_video_id: 'video_001',
    files: [
      {
        id: 'file_001',
        class_id: 'class_001',
        title: 'Class Notes',
        path: '/files/class_notes.pdf',
        size: '2MB',
      },
      {
        id: 'file_002',
        class_id: 'class_001',
        title: 'Supplementary Material',
        path: '/files/supplementary_material.pdf',
        size: '1MB',
      },
    ],
  },
  schedules_individual: [
    {
      id: 'schedule_001',
      title: 'Mentoring Session',
      description: 'Mentoring session to discuss progress and challenges.',
      date: '2024-12-01',
      start_time: '08:00',
      end_time: '09:00',
      student: {
        student_id: 'student_001',
        name: 'John Doe',
      },
    },
    {
      id: 'schedule_002',
      title: 'Mentoring Session',
      description: 'Mentoring session to discuss progress and challenges.',
      date: '2024-12-01',
      start_time: '09:00',
      end_time: '10:00',
      student: {
        student_id: 'student_002',
        name: 'Jane Smith',
      },
    },
  ],
  schedules_groups: [
    {
      id: 'schedule_003',
      title: 'Weekly Mentoring Session',
      description:
        'Group mentoring session to discuss progress and challenges.',
      date: '2024-12-01',
      start_time: '14:00',
      end_time: '16:00',
      students: [
        {
          student_id: 'student_003',
          name: 'Alice Johnson',
        },
        {
          student_id: 'student_004',
          name: 'Bob Brown',
        },
      ],
    },
    {
      id: 'schedule_004',
      title: 'Monthly Mentoring Session',
      description:
        'Group mentoring session to discuss progress and challenges.',
      date: '2024-12-15',

      start_time: '16:00',
      end_time: '18:00',
      students: [
        {
          student_id: 'student_005',
          name: 'Charlie Green',
        },
        {
          student_id: 'student_006',
          name: 'Diana White',
        },
      ],
    },
  ],
}
