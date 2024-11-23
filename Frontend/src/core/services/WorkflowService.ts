import { injectable } from 'inversify';
import type { Workflow, WorkflowStage } from '../domain/models/Workflow';
import { IWorkflowService } from '../interfaces/services';
import { ApiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';

@injectable()
export class WorkflowService implements IWorkflowService {
  async getOrCreateWorkflow(): Promise<Workflow> {
    try {
      const workflows = await ApiClient.get<Workflow[]>(API_ENDPOINTS.WORKFLOW.BASE);
      
      if (workflows.length > 0) {
        return workflows[0];
      }

      // If no workflows exist, get default template and create new workflow
      const defaultTemplate = await ApiClient.get<Workflow>(API_ENDPOINTS.WORKFLOW.DEFAULT);
      return await ApiClient.post<Workflow>(API_ENDPOINTS.WORKFLOW.BASE, defaultTemplate);
    } catch (error) {
      console.error('Failed to get or create workflow:', error);
      throw error;
    }
  }

  async getWorkflow(workflowId: string): Promise<Workflow> {
    try {
      return await ApiClient.get<Workflow>(API_ENDPOINTS.WORKFLOW.BY_ID(workflowId));
    } catch (error) {
      console.error('Failed to get workflow:', error);
      throw error;
    }
  }

  async getStages(workflowId: string): Promise<WorkflowStage[]> {
    try {
      const workflow = await this.getWorkflow(workflowId);
      return workflow.stage_order.map((stageId) => {
        const stage = workflow.stages.find(s => s.id === stageId);
        if (!stage) throw new Error(`Stage with id ${stageId} not found`);
        return stage;
      });
    } catch (error) {
      console.error('Failed to get stages:', error);
      throw error;
    }
  }

  async getColorForStage(workflowId: string, stageId: string): Promise<string> {
    try {
      const workflow = await this.getWorkflow(workflowId);
      const stage = workflow.stages.find(s => s.id === stageId);
      return stage ? stage.color : 'gray';
    } catch (error) {
      console.error('Failed to get stage color:', error);
      throw error;
    }
  }

  async getStageById(workflowId: string, stageId: string): Promise<WorkflowStage | undefined> {
    try {
      const workflow = await this.getWorkflow(workflowId);
      return workflow.stages.find(s => s.id === stageId);
    } catch (error) {
      console.error('Failed to get stage:', error);
      throw error;
    }
  }

  async updateWorkflow(workflow: Workflow): Promise<Workflow> {
    try {
      return await ApiClient.put<Workflow>(
        API_ENDPOINTS.WORKFLOW.BY_ID(workflow.id), 
        workflow
      );
    } catch (error) {
      console.error('Failed to update workflow:', error);
      throw error;
    }
  }

  async updateStage(workflowId: string, stageId: string, stage: WorkflowStage): Promise<Workflow> {
    try {
      return await ApiClient.put<Workflow>(
        API_ENDPOINTS.WORKFLOW.STAGES.BY_ID(workflowId, stageId),
        stage
      );
    } catch (error) {
      console.error('Failed to update stage:', error);
      throw error;
    }
  }

  async updateStageOrder(workflowId: string, stageOrder: string[]): Promise<Workflow> {
    try {
      return await ApiClient.put<Workflow>(
        API_ENDPOINTS.WORKFLOW.STAGES.ORDER(workflowId),
        stageOrder
      );
    } catch (error) {
      console.error('Failed to update stage order:', error);
      throw error;
    }
  }

  async updateStageVisibility(workflowId: string, stageId: string, visible: boolean): Promise<Workflow> {
    try {
      return await ApiClient.put<Workflow>(
        API_ENDPOINTS.WORKFLOW.STAGES.VISIBILITY(workflowId, stageId),
        { visible }
      );
    } catch (error) {
      console.error('Failed to update stage visibility:', error);
      throw error;
    }
  }
}