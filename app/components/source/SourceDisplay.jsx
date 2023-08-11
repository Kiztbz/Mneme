import { ListItem, Card } from "@components/client";
import styles from "./SourceDisplay.module.css";
import { capitalize } from "@/lib/strings";

export function SourceDisplay({ source }) {
    return (
        <Card
            title={source.title}
            subtitle={capitalize(source.medium)}
            buttons={[
                {
                    label: "Visit the source page",
                    link: source.url,
                },
            ]}
        >
            <div className={styles.authors}>
                <h5>Authors</h5>
                {source.authors?.length > 0 ? (
                    <ol className="chipList">
                        {source.authors?.map((cont) => (
                            <ListItem
                                key={cont}
                                item={
                                    /^http/.test(cont)
                                        ? "See all of the authors"
                                        : cont
                                }
                                link={/^http/.test(cont) ? cont : null}
                            />
                        ))}
                    </ol>
                ) : (
                    <p>No authors listed</p>
                )}
            </div>
        </Card>
    );
}