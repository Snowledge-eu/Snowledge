export const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString();
  } catch (error) {
    return "Invalid Date";
  }
};

export const formatDateTime = (
  dateString: string | Date | undefined
): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleString();
  } catch (error) {
    return "Invalid Date";
  }
};

export const extractAnalysisInfo = (analysis: any) => {
  // Handle MongoDB document structure
  const doc = analysis._doc || analysis;

  // Extract ID properly
  let analysisId = "N/A";
  if (doc._id) {
    if (typeof doc._id === "string") {
      analysisId = doc._id;
    } else if (doc._id.buffer) {
      // Convert Buffer to string
      analysisId = Buffer.from(doc._id.buffer.data).toString("hex");
    } else if (doc._id.toString) {
      analysisId = doc._id.toString();
    }
  }

  // Extract scope info
  let scopeInfo = "N/A";
  if (doc.scope) {
    if (doc.scope.server_id && doc.scope.channel_id) {
      const serverId = doc.scope.server_id.low || doc.scope.server_id;
      const channelId = doc.scope.channel_id.low || doc.scope.channel_id;
      scopeInfo = `Server: ${serverId}, Channel: ${channelId}`;
    }
  }

  // Extract period info
  let periodInfo = "N/A";
  if (doc.period) {
    const from = formatDate(doc.period.from);
    const to = formatDate(doc.period.to);
    periodInfo = `${from} → ${to}`;
  }

  // Extract result summary
  let resultSummary = "N/A";
  if (doc.result && doc.result.choices && doc.result.choices[0]) {
    try {
      const content = doc.result.choices[0].message.content;
      const parsed = JSON.parse(content);
      if (parsed.trends && parsed.trends[0]) {
        resultSummary = parsed.trends[0].title || "Analysis completed";
      } else {
        resultSummary = "Analysis completed";
      }
    } catch (error) {
      resultSummary = "Analysis completed";
    }
  }

  return {
    id: analysisId,
    creator_id: doc.creator_id || "N/A",
    platform: doc.platform || "N/A",
    prompt_key: doc.prompt_key || "N/A",
    llm_model: doc.llm_model || "N/A",
    scope: scopeInfo,
    period: periodInfo,
    result_summary: resultSummary,
    created_at: doc.created_at || analysis.created_at,
    updated_at: doc.updated_at || analysis.updated_at,
    full_data: analysis, // Keep full data for detailed view
  };
};

export const getMongoDocData = (analysis: any, field: string) => {
  const doc = (analysis as any)._doc || analysis;
  return doc[field] || analysis[field];
};
