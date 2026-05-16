using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialUpdate2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SizeDefaultKey",
                table: "AppSettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "SizeLgActive",
                table: "AppSettings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SizeLgLabel",
                table: "AppSettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "SizeMdActive",
                table: "AppSettings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SizeMdLabel",
                table: "AppSettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "SizeSmActive",
                table: "AppSettings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SizeSmLabel",
                table: "AppSettings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SizeDefaultKey",
                table: "AppSettings");

            migrationBuilder.DropColumn(
                name: "SizeLgActive",
                table: "AppSettings");

            migrationBuilder.DropColumn(
                name: "SizeLgLabel",
                table: "AppSettings");

            migrationBuilder.DropColumn(
                name: "SizeMdActive",
                table: "AppSettings");

            migrationBuilder.DropColumn(
                name: "SizeMdLabel",
                table: "AppSettings");

            migrationBuilder.DropColumn(
                name: "SizeSmActive",
                table: "AppSettings");

            migrationBuilder.DropColumn(
                name: "SizeSmLabel",
                table: "AppSettings");
        }
    }
}
