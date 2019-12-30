import { scheduleJobEndExperiment } from '../../mockData/experiment/index';
import { Logger as WinstonLogger } from '../../../../src/lib/logger';
import { ExperimentService } from '../../../../src/api/services/ExperimentService';
import { Container } from 'typedi';
import { ScheduledJobService } from '../../../../src/api/services/ScheduledJobService';
import { SCHEDULE_TYPE } from '../../../../src/api/models/ScheduledJob';
import { EXPERIMENT_STATE } from 'ees_types';

export default async function DeleteEndExperiment(): Promise<void> {
  const logger = new WinstonLogger(__filename);
  const experimentService = Container.get<ExperimentService>(ExperimentService);
  const scheduledJobService = Container.get<ScheduledJobService>(ScheduledJobService);

  // experiment object
  const experimentObject = scheduleJobEndExperiment;

  // create experiment
  await experimentService.create(scheduleJobEndExperiment as any);
  let experiments = await experimentService.find();
  expect(experiments).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: experimentObject.name,
        state: experimentObject.state,
        postExperimentRule: experimentObject.postExperimentRule,
        assignmentUnit: experimentObject.assignmentUnit,
        consistencyRule: experimentObject.consistencyRule,
      }),
    ])
  );

  await new Promise(r => setTimeout(r, 1000));
  let endExperiment = await scheduledJobService.getAllEndExperiment();

  expect(endExperiment).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        experimentId: experiments[0].id,
        type: SCHEDULE_TYPE.END_EXPERIMENT,
        timeStamp: new Date(experimentObject.endOn),
      }),
    ])
  );

  const updatedExperiment = {
    ...experiments[0],
    state: EXPERIMENT_STATE.ENROLLMENT_COMPLETE,
  };

  await experimentService.update(updatedExperiment.id, updatedExperiment);
  experiments = await experimentService.find();
  expect(experiments).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: experimentObject.name,
        state: EXPERIMENT_STATE.ENROLLMENT_COMPLETE,
        postExperimentRule: experimentObject.postExperimentRule,
        assignmentUnit: experimentObject.assignmentUnit,
        consistencyRule: experimentObject.consistencyRule,
      }),
    ])
  );

  await new Promise(r => setTimeout(r, 1000));
  endExperiment = await scheduledJobService.getAllEndExperiment();
  expect(endExperiment.length).toEqual(0);
}
