using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bilgenly.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsCompletedToAttempt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsCompleted",
                table: "Attempts",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsCompleted",
                table: "Attempts");
        }
    }
}
