export interface EmailMarketingMetrics{
    id: string,
    subject: string,
    message: string,
    contacts_count: number,
    scheduled: boolean,
    schedule_time: string,
    type_action: string,
    link: string,
    file_url: string,
    created_at: string,
    leads_seen: ContactsMetrics[]
}

export interface ContactsMetrics{
    email: string,
    name: string
}