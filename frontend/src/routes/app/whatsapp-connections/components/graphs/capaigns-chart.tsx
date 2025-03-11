import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart.tsx";
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts";
import {Campaign} from "@/types/campaign";

const config: ChartConfig = {
    total: {
        label: 'Total',
    },
}

export function CampaignsChart({
    campaigns,
}: {campaigns: Campaign[]}) {

    console.log(campaigns);

    const dataCampaigns = campaigns.map((campaign) => {
        return {
            name: campaign.title,
            total: campaign.participants
        }
    })

    return (
        <div className={`w-full max-w-3xl mx-auto`}>
            <ChartContainer config={config}>
                <BarChart accessibilityLayer data={dataCampaigns}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ChartContainer>
        </div>
    )
}