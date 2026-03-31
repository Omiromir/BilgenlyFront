FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["Bilgenly.API/Bilgenly.API.csproj", "Bilgenly.API/"]
COPY ["Bilgenly.Application/Bilgenly.Application.csproj", "Bilgenly.Application/"]
COPY ["Bilgenly.Domain/Bilgenly.Domain.csproj", "Bilgenly.Domain/"]
COPY ["Bilgenly.Infrastructure/Bilgenly.Infrastructure.csproj", "Bilgenly.Infrastructure/"]

RUN dotnet restore "Bilgenly.API/Bilgenly.API.csproj"

COPY . .
WORKDIR "/src/Bilgenly.API"
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Bilgenly.API.dll"]