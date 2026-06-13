/**********************************************************************************************************************
 * Filename:    skymip-763_reports_menu_security.p                                                                    *
 * Log Number:  skymip-763                                                                                            *
 * Description: reports menu security for roles as listed in procedure parameter cRoleList                            *
***********************************************************************************************************************/
{dcr/sys/inc/pfdcr.i}
{mip/inc/mipdefshared.i}

// person One 
RUN getLayoutDataStructure (
    "sd_NewBusinessFuneral":U,
    "sd_quOneDateOfBirth":U
).

// person Two 
RUN getLayoutDataStructure (
    "sd_NewBusinessFuneral":U,
    "sd_quTwoDateOfBirth":U
).

ASSIGN lDCRRunComplete = TRUE.

FINALLY:
    ASSIGN cErrorMesg = {mip/inc/mipreturnvalue.i} NO-ERROR.
    {mip/inc/mipthrowerror.i}
    
    SESSION:SET-WAIT-STATE("").

    IF cErrorMesg <> "":U THEN
    DO:
      PUT STREAM sLog UNFORMATTED "<em>Exception ---> " cErrorMesg "</em>" SKIP.
      RETURN ERROR cErrorMesg.
    END.
    ELSE
      PUT STREAM sAudit UNFORMATTED "=== DCR COMPLETED SUCCESSFULLY ===" SKIP.
      
    {mip/inc/mipcatcherror.i}
END FINALLY.

PROCEDURE getLayoutDataStructure :
/*------------------------------------------------------------------------------
  Purpose: Get layout_data_structure for a question in a questionnaire
  Parameters:
    pcQuestionnaireCode - Questionnaire code
    pcQuestionCode      - Question code
------------------------------------------------------------------------------*/

  DEFINE INPUT PARAMETER pcQuestionnaireCode AS CHARACTER NO-UNDO.
  DEFINE INPUT PARAMETER pcQuestionCode      AS CHARACTER NO-UNDO.

  FIND FIRST qum_questionnaire NO-LOCK
       WHERE qum_questionnaire.questionnaire_code = pcQuestionnaireCode
    NO-ERROR.

  IF NOT AVAILABLE qum_questionnaire THEN DO:
    PUT STREAM sAudit UNFORMATTED "Questionnaire not found: " pcQuestionnaireCode SKIP.
    RETURN.
  END.

  FIND FIRST qum_question NO-LOCK
       WHERE qum_question.question_code = pcQuestionCode
    NO-ERROR.

  IF NOT AVAILABLE qum_question THEN DO:
    PUT STREAM sAudit UNFORMATTED "Question not found: " pcQuestionCode SKIP.
    RETURN.
  END.

  FIND FIRST qum_layout NO-LOCK
       WHERE qum_layout.question_obj      = qum_question.question_obj
         AND qum_layout.questionnaire_obj = qum_questionnaire.questionnaire_obj
    NO-ERROR.

  IF NOT AVAILABLE qum_layout THEN DO:
    PUT STREAM sAudit UNFORMATTED "Layout not found: " pcQuestionCode SKIP.RETURN.
  END.

  ASSIGN
    qum_layout.layout_data_structure = "cb.db.agm_person.date_of_birth":U
    qum_layout.layout_data_context   = "ermpe":U
    .
    
  MESSAGE qum_layout.layout_data_structure SKIP      
      VIEW-AS ALERT-BOX INFO.
      
  MESSAGE qum_layout.layout_data_context SKIP
      VIEW-AS ALERT-BOX INFO.

END PROCEDURE.