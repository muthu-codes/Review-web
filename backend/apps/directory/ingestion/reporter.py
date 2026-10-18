"""
Report Generator for Ingestion Operations.
Formats statistical summaries for terminal stdout and audit logs.
"""

def generate_cli_report(summary):
    """
    Returns a formatted multiline string for terminal output.
    """
    mode = "DRY RUN (No changes saved to database)" if summary.get('dry_run') else "LIVE IMPORT (Saved to database)"
    lines = [
        "",
        "=" * 68,
        f"  REVIEW WEB — TIRUNELVELI DISTRICT INGESTION REPORT",
        "=" * 68,
        f"  Mode:                {mode}",
        f"  Source:              {summary.get('source_name', 'osm').upper()}",
        f"  Duration:            {summary.get('duration_seconds', 0.0):.2f}s",
        "-" * 68,
        f"  Features Examined:   {summary.get('features_examined', 0)}",
        f"  Records Inserted:    {summary.get('records_inserted', 0)}",
        f"  Records Updated:     {summary.get('records_updated', 0)}",
        f"  Records Skipped:     {summary.get('records_skipped', 0)}",
        f"  Records Rejected:    {summary.get('records_rejected', 0)}",
        "-" * 68,
    ]

    rejections = summary.get('rejection_reasons', {})
    if rejections:
        lines.append("  Rejection Reasons:")
        for reason, cnt in rejections.items():
            lines.append(f"    - {reason}: {cnt}")
        lines.append("-" * 68)

    cats = summary.get('category_counts', {})
    if cats:
        lines.append("  Category Distribution (New):")
        for cat, cnt in sorted(cats.items(), key=lambda x: -x[1]):
            lines.append(f"    - {cat:<36} {cnt:>4}")
        lines.append("-" * 68)

    towns = summary.get('town_counts', {})
    if towns:
        lines.append("  Town Distribution (New):")
        for twn, cnt in sorted(towns.items(), key=lambda x: -x[1]):
            lines.append(f"    - {twn:<36} {cnt:>4}")
        lines.append("-" * 68)

    lines.append("=" * 68)
    lines.append("")
    return "\n".join(lines)
