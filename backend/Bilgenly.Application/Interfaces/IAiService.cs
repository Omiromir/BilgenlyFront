using Bilgenly.Application.DTOs;

namespace Bilgenly.Application.Interfaces;

public interface IAiService
{
    Task<List<CreateQuestionDto>> GenerateFromTextAsync(
        string text,
        int questionCount,
        string topic,
        string topicFocus,
        string questionType,
        string additionalInstructions);

    Task<List<CreateQuestionDto>> GenerateFromPdfAsync(
        byte[] fileBytes,
        int questionCount,
        string topic,
        string topicFocus,
        string questionType,
        string additionalInstructions);
}