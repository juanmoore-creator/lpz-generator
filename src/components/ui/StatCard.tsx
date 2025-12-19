import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

export const StatCard = ({ label, value, subtext, color = "blue" }: { label: string, value: string, subtext?: string, color?: "blue" | "green" | "amber" }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        green: "bg-emerald-50 text-emerald-700 border-emerald-100",
        amber: "bg-amber-50 text-amber-700 border-amber-100"
    };

    return (
        <div className={cn("p-6 rounded-xl border", colors[color])}>
            <div className="text-sm font-medium opacity-80 mb-1">{label}</div>
            <div className="text-3xl font-bold tracking-tight">{value}</div>
            {subtext && <div className="text-xs mt-2 opacity-70">{subtext}</div>}
        </div>
    );
};
