import CoverPage from './report/CoverPage';
import MapPage from './report/MapPage';
import SummaryPage from './report/SummaryPage';
import PropertyDetailPage from './report/PropertyDetailPage';
import PriceSuggestionPage from './report/PriceSuggestionPage';
import AveragesPage from './report/AveragesPage';
import ContactPage from './report/ContactPage';

const ReportView = ({ data, properties, valuation, stats, theme }: { data: any, properties: any[], valuation: any, stats: any, theme?: { primary: string, secondary: string } }) => {
    return (
        <div id="report-view">
            <CoverPage data={data} theme={theme} />
            <MapPage properties={properties} theme={theme} />
            <SummaryPage properties={properties} theme={theme} />

            {properties.map((prop, index) => (
                <PropertyDetailPage key={prop.id || index} property={prop} index={index} theme={theme} />
            ))}

            <PriceSuggestionPage data={valuation} stats={stats} theme={theme} />
            <AveragesPage properties={properties} theme={theme} />
            <ContactPage data={data} theme={theme} />
        </div>
    );
};

export default ReportView;
