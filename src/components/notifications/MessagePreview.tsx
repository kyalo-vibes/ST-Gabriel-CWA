interface MessagePreviewProps {
  message: string;
}

export function MessagePreview({ message }: MessagePreviewProps) {
  // Replace placeholders with example values for preview
  const previewMessage = message
    .replace(/{name}/g, 'Jane Mwangi')
    .replace(/{contributionType}/g, 'Welfare')
    .replace(/{amount}/g, '5,000')
    .replace(/{dueDate}/g, '31 Oct 2024')
    .replace(/{balance}/g, '2,500')
    .replace(/{date}/g, '28 Oct 2024')
    .replace(/{time}/g, '2:00 PM')
    .replace(/{purpose}/g, 'Sister Mary\'s medical fund');

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
          <span className="text-white text-xs">CWA</span>
        </div>
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg rounded-tl-none p-3 shadow-sm">
            <p className="text-sm whitespace-pre-wrap">{previewMessage}</p>
            <span className="text-xs text-gray-400 mt-2 block">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
