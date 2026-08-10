import { CSSProperties } from "react";

type AdvertisementFormat = "auto" | "horizontal" | "vertical" | "rectangle";

interface AdvertisementProps {
    className?: string;
    style?: CSSProperties;
    publisherId?: string;
    adUnitId: string;
    format?: AdvertisementFormat;
    fullWidthResponsive?: boolean;
}

export default AdvertisementProps;
