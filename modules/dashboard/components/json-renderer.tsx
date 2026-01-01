import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Recursive renderer for complex agent outputs
export const JsonRenderer = ({ data }: { data: any }) => {
    if (!data) return null;

    if (typeof data === 'string') {
        // Check if it looks like Markdown or just simple text
        if (data.length > 50 || data.includes('#') || data.includes('*')) {
            return (
                <div className="mb-4 bg-muted/10 p-4 rounded-lg prose prose-invert text-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {data}
                    </ReactMarkdown>
                </div>
            );
        }
        return <p className="text-foreground mb-2 text-base leading-relaxed">{data}</p>;
    }

    if (Array.isArray(data)) {
        return (
            <ul className="list-none space-y-2 mb-4 pl-0">
                {data.map((item, index) => (
                    <li key={index} className="pl-4 border-l-2 border-primary/30">
                        <JsonRenderer data={item} />
                    </li>
                ))}
            </ul>
        );
    }

    if (typeof data === 'object') {
        return (
            <div className="grid gap-4 mb-4">
                {Object.entries(data).map(([key, value], index) => {
                    // Skip internal or empty keys
                    if (!value || key === 'id') return null;

                    return (
                        <div key={index} className="bg-card/20 rounded-lg p-3 border border-border/30">
                            <h4 className="font-semibold text-primary mb-2 capitalize text-sm tracking-wide">
                                {key.replace(/_/g, ' ')}
                            </h4>
                            <div className="pl-2">
                                <JsonRenderer data={value} />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return <span className="text-muted-foreground">{String(data)}</span>;
};
