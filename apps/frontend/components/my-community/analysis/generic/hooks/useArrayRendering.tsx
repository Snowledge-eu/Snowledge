import React from "react";

// ============
// Hook pour le rendu des tableaux
// ============

export const useArrayRendering = () => {
  // Rend un tableau de messages avec style spécial
  const renderMessageArray = (data: string[], title: string, key: string) => {
    const colorScheme =
      key === "top_positive_messages"
        ? "green"
        : key === "top_negative_messages"
          ? "red"
          : "amber";

    const bgColor =
      colorScheme === "green"
        ? "from-green-50 to-emerald-50 border-green-200"
        : colorScheme === "red"
          ? "from-red-50 to-pink-50 border-red-200"
          : "from-amber-50 to-orange-50 border-amber-200";

    const iconColor =
      colorScheme === "green"
        ? "text-green-600"
        : colorScheme === "red"
          ? "text-red-600"
          : "text-amber-600";

    const avatarColor =
      colorScheme === "green"
        ? "bg-green-100"
        : colorScheme === "red"
          ? "bg-red-100"
          : "bg-amber-100";

    const lineColor =
      colorScheme === "green"
        ? "from-green-200 to-emerald-300"
        : colorScheme === "red"
          ? "from-red-200 to-pink-300"
          : "from-amber-200 to-orange-300";

    const dotColor =
      colorScheme === "green"
        ? "bg-green-500"
        : colorScheme === "red"
          ? "bg-red-500"
          : "bg-amber-500";

    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <div className={`w-2 h-2 ${dotColor} rounded-full`}></div>
          {title}
        </h3>
        <div className="space-y-3">
          {data.map((message: string, index: number) => (
            <div key={index} className="relative">
              <div
                className={`absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b ${lineColor}`}
              ></div>
              <div
                className={`ml-6 bg-gradient-to-r ${bgColor} border rounded-xl p-4 shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 ${avatarColor} rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    {key === "top_positive_messages" ? (
                      <svg
                        className={`w-4 h-4 ${iconColor}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : key === "top_negative_messages" ? (
                      <svg
                        className={`w-4 h-4 ${iconColor}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className={`w-4 h-4 ${iconColor}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                      {message}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Rend un tableau de strings simples
  const renderStringArray = (data: string[], title: string) => {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          {title}
        </h3>
        <ul className="space-y-2">
          {data.map((item: string, index: number) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg"
            >
              <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Rend un tableau d'objets
  const renderObjectArray = (data: any[], title: string, key: string) => {
    const isUserField = key.includes("users") || key.includes("user");
    const iconColor = isUserField ? "bg-blue-100" : "bg-primary/10";
    const dotColor = isUserField ? "bg-blue-500" : "bg-primary";

    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <div className={`w-2 h-2 ${dotColor} rounded-full`}></div>
          {title}
        </h3>
        <div className="grid gap-3">
          {data.map((item: any, index: number) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div
                className={`w-8 h-8 ${iconColor} rounded-full flex items-center justify-center text-sm font-medium`}
              >
                {isUserField ? (
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                ) : typeof item === "string" ? (
                  item.charAt(0).toUpperCase()
                ) : (
                  (item.name || item.user || `#${index + 1}`)
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {typeof item === "string"
                    ? item
                    : item.name ||
                      item.user ||
                      item.username ||
                      item.auteur ||
                      item.title ||
                      `Item ${index + 1}`}
                </p>

                {/* Messages spéciaux pour les différents types d'objets */}
                {item.message && (
                  <p className="text-xs text-muted-foreground italic mt-1">
                    "{item.message}"
                  </p>
                )}
                {item.nombre_de_messages && (
                  <p className="text-xs text-blue-600 font-medium">
                    {item.nombre_de_messages} messages
                  </p>
                )}
                {item.sentiment && (
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      item.sentiment === "positif"
                        ? "bg-green-100 text-green-700"
                        : item.sentiment === "négatif"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.sentiment}
                  </span>
                )}

                {/* Propriétés existantes */}
                {item.reason && (
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                )}
                {item.description && (
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
                {item.score && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <span className="text-xs text-blue-600 font-medium">
                      {item.score}%
                    </span>
                  </div>
                )}
                {item.activity_level && (
                  <p className="text-xs text-green-600 font-medium">
                    Activité: {item.activity_level}
                  </p>
                )}

                {/* Affichage générique pour les autres propriétés */}
                {Object.entries(item).map(([prop, val]) => {
                  // Skip les propriétés déjà affichées
                  const displayedProps = [
                    "name",
                    "user",
                    "username",
                    "auteur",
                    "title",
                    "message",
                    "nombre_de_messages",
                    "sentiment",
                    "reason",
                    "description",
                    "score",
                    "activity_level",
                  ];
                  if (displayedProps.includes(prop) || typeof val === "object")
                    return null;

                  return (
                    <p key={prop} className="text-xs text-muted-foreground">
                      <span className="font-medium capitalize">
                        {prop.replace(/_/g, " ")}:{" "}
                      </span>
                      {String(val)}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Rend un tableau de données de manière intelligente
  const renderArray = (data: any[], title: string, key: string) => {
    if (!data || data.length === 0) return null;

    // Si c'est un tableau de strings simples
    if (typeof data[0] === "string") {
      // Traitement spécial pour les messages
      if (
        key === "notable_messages" ||
        key === "top_positive_messages" ||
        key === "top_negative_messages"
      ) {
        return renderMessageArray(data, title, key);
      }

      // Rendu standard pour les autres tableaux de strings
      return renderStringArray(data, title);
    }

    // Si c'est un tableau d'objets
    return renderObjectArray(data, title, key);
  };

  return { renderArray };
};
