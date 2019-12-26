import { JsonController, Post, BodyParam } from 'routing-controllers';
import { ExcludeService } from '../services/ExcludeService';
import { ExplicitIndividualExclusion } from '../models/ExplicitIndividualExclusion';
import { ExplicitGroupExclusion } from '../models/ExplicitGroupExclusion';

/**
 * @swagger
 * tags:
 *   - name: Exclude
 *     description: To Exclude Users and Groups from experiments
 */
@JsonController('/exclude')
export class ExcludeController {
  constructor(public exclude: ExcludeService) {}

  /**
   * @swagger
   * /exclude/user:
   *    post:
   *       description: Exclude an User
   *       consumes:
   *         - application/json
   *       parameters:
   *         - in: body
   *           name: id
   *           required: true
   *           schema:
   *             type: string
   *           description: UserId to exclude
   *       tags:
   *         - Exclude
   *       produces:
   *         - application/json
   *       responses:
   *          '200':
   *            description: Exclude user from experiment
   */
  @Post('/user')
  public excludeUser(@BodyParam('id') id: string): Promise<ExplicitIndividualExclusion> {
    return this.exclude.excludeUser(id);
  }

  /**
   * @swagger
   * /exclude/group:
   *    post:
   *       description: Exclude a Group
   *       consumes:
   *         - application/json
   *       parameters:
   *         - in: body
   *           name: type
   *           required: true
   *           schema:
   *             type: string
   *           description: Group type to exclude
   *         - in: body
   *           name: id
   *           required: true
   *           schema:
   *             type: string
   *           description: Group Id to exclude
   *       tags:
   *         - Exclude
   *       produces:
   *         - application/json
   *       responses:
   *          '200':
   *            description: Exclude group from experiment
   */
  @Post('/group')
  public excludeGroup(@BodyParam('type') type: string, @BodyParam('id') id: string): Promise<ExplicitGroupExclusion> {
    return this.exclude.excludeGroup(id, type);
  }
}