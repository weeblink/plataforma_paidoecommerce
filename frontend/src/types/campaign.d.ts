export interface Campaign {
    id: string,
    title: string,
    groups_ids: string[],
    messages: string[],
    participants: number,
    created_at: string,
}