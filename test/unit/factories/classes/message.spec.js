(function() {

	'use strict';
	/* jasmine spacs for the availability factory */
	describe('Message object', function() {
		var testObject, dataService, Data, Message, $httpBackend, SentMessage, Employee, areas, employees, semesters, sentMessages, messages;

		beforeEach(module('Services'));

		// mock the dataService until I have it properly defined.
		beforeEach(module(function($provide) {
			$provide.service('dataService', [
				function dataService() {
					var service = this;

					// inject the required services and values for the dataService
					inject(function(sharePointUrl, $http) {
						service.sharePointUrl = sharePointUrl;
						service.$http = $http;
					})
					this.fetchJson = function(url) {
						return service.$http.get(url, {
							headers: {
								'accept': 'application/json;odata=verbose',
							}
						});
					}
					this.addItem = function(listName, item) {
						return service.$http.post(this.sharePointUrl +
							'_api/lists/getbytitle(\'' + listName + '\')/items', item);
					};
					this.updateItem = function(listName, itemId, item, etag) {
						return service.$http({
							method: 'POST',
							url: this.sharePointUrl + '_api/lists/getbytitle(\'' +
								listName + '\')/items(' + itemId + ')',
							data: item,
							headers: {
								'accept': 'application/json;odata=verbose',
								'content-type': 'application/json;odata=verbose',
								'IF-MATCH': etag,
								'X-HTTP-Method': 'MERGE'
							}
						});
					};
					this.fetchItem = function(listName, itemId) {
						return this.fetchJson(this.sharePointUrl +
							'_api/lists/getbytitle(\'' + listName + '\')/items(\'' + itemId +
							'\')', false);
					};
					this.deleteItem = function(listName, itemId) {
						return service.$http({
							method: 'POST',
							url: this.sharePointUrl +
								'_api/lists/getbytitle(\'' +
								listName + '\')/items(' + itemId + ')',
							headers: {
								'X-HTTP-Method': 'DELETE',
								'IF-MATCH': '*'
							}
						});
					};
					return this;
				}
			]);
			$provide.value('currentSemester', {
				Id: 2
			});
			$provide.factory('SentMessage', [
				function() {
					var $_q;
					inject(function($q) {
						$_q = $q;
					})

					function SentMessage(empId, messId) {
						this.Id = empId;
						this.MessageId = messId;
						this.initAttributes();
					}
					SentMessage.prototype.initAttributes = function() {
						return null;
					};
					SentMessage.prototype.toString = function() {
						return 'Temp SentMessage';
					};
					SentMessage.prototype.add = function() {
						var deffered = $_q.defer();
						deffered.resolve();
						return deffered.promise;
					};
					return SentMessage;
				}
			]);
		}));

		// setup for the execution of each test
		beforeEach(function() {
			var thisPrep = this;
			// assign local variable to injections of services.
			inject(function($injector) {
				Data = $injector.get('Data');
				Message = $injector.get('Message');
				dataService = $injector.get('dataService');
				$httpBackend = $injector.get('$httpBackend');
				areas = $injector.get('areas');
				employees = $injector.get('employees');
				semesters = $injector.get('semesters');
				messages = $injector.get('messages');
				sentMessages = $injector.get('sentMessages');
				Employee = $injector.get('Employee');
				SentMessage = $injector.get('SentMessage');
			});

			// $httpBackend Config
			$httpBackend.whenGET('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Message\')/items(\'3468\')').respond({
				d: {
					Id: 3468
				}
			});
			$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Message\')/items(3468)').respond([]);
			$httpBackend.whenPOST('https://inet.byui.edu/sites/TestingServices/_api/lists/getbytitle(\'Message\')/items').respond({
				d: {
					Id: 3468
				}
			});

			// array and object initialization
			areas.list[0] = {
				Id: 3
			};
			employees.list[0] = new Employee({
				Id: 6664
			});
			semesters.list[0] = {
				Id: 2
			};
			sentMessages.list[0] = {
				Id: 2,
				MessageId: 3468
			};
			sentMessages.list[1] = {
				Id: 1,
				MessageId: 3467
			};

			testObject = new Message({
				"__metadata": {
					"id": "Web/Lists(guid'd819bc0d-5989-4513-a574-9712e0a1ac4d')/Items(3468)",
					"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd819bc0d-5989-4513-a574-9712e0a1ac4d')/Items(3468)",
					"etag": "\"2\"",
					"type": "SP.Data.MessageListItem"
				},
				"FirstUniqueAncestorSecurableObject": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd819bc0d-5989-4513-a574-9712e0a1ac4d')/Items(3468)/FirstUniqueAncestorSecurableObject"
					}
				},
				"RoleAssignments": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd819bc0d-5989-4513-a574-9712e0a1ac4d')/Items(3468)/RoleAssignments"
					}
				},
				"AttachmentFiles": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd819bc0d-5989-4513-a574-9712e0a1ac4d')/Items(3468)/AttachmentFiles"
					}
				},
				"ContentType": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd819bc0d-5989-4513-a574-9712e0a1ac4d')/Items(3468)/ContentType"
					}
				},
				"FieldValuesAsHtml": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd819bc0d-5989-4513-a574-9712e0a1ac4d')/Items(3468)/FieldValuesAsHtml"
					}
				},
				"FieldValuesAsText": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd819bc0d-5989-4513-a574-9712e0a1ac4d')/Items(3468)/FieldValuesAsText"
					}
				},
				"FieldValuesForEdit": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd819bc0d-5989-4513-a574-9712e0a1ac4d')/Items(3468)/FieldValuesForEdit"
					}
				},
				"File": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd819bc0d-5989-4513-a574-9712e0a1ac4d')/Items(3468)/File"
					}
				},
				"Folder": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd819bc0d-5989-4513-a574-9712e0a1ac4d')/Items(3468)/Folder"
					}
				},
				"ParentList": {
					"__deferred": {
						"uri": "https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid'd819bc0d-5989-4513-a574-9712e0a1ac4d')/Items(3468)/ParentList"
					}
				},
				"FileSystemObjectType": 0,
				"Id": 3468,
				"FromId": 6664,
				"Subject": "test4",
				"Body": "<div class=\"ExternalClassC2AFE3C857BF427D97A96BB2A7154AD6\">still a test</div>",
				"ExpDate": "2015-02-10T07:00:00Z",
				"DueDate": "2015-02-10T07:00:00Z",
				"Policy": false,
				"Mandatory": false,
				"AreaId": 3,
				"SemesterId": 2,
				"Active": false,
				"Title": "title",
				"ContentTypeId": "0x0100183BE999D4F38E499C54F7EB0AEB0C92",
				"ID": 3468,
				"Modified": "2015-02-05T22:07:47Z",
				"Created": "2015-02-03T15:17:33Z",
				"AuthorId": 11,
				"EditorId": 11,
				"OData__UIVersionString": "1.0",
				"Attachments": false,
				"GUID": "8fc974fe-4357-4376-900e-a71aabb9aae9"
			});

			// Spies
			spyOn(dataService, 'addItem').andCallThrough();
			spyOn(dataService, 'updateItem').andCallThrough();
			spyOn(dataService, 'fetchItem').andCallThrough();
			spyOn(dataService, 'deleteItem').andCallThrough();
			spyOn(Message.prototype, 'updateData').andCallThrough();
			spyOn(Message.prototype, 'initAttributes').andCallThrough();
			spyOn(Message.prototype, 'add').andCallThrough();
			spyOn(Message.prototype, 'update').andCallThrough();
			spyOn(Message.prototype, 'refresh').andCallThrough();
			spyOn(Employee.prototype, 'toString').andCallThrough();
			spyOn(Autolinker, 'link').andCallThrough();
			spyOn(Data.prototype, 'add').andCallThrough();
			spyOn(SentMessage.prototype, 'initAttributes').andCallThrough();
			spyOn(SentMessage.prototype, 'add').andCallThrough();
		});

		// verify that we have cleaned up all of our $httpBackend usage.
		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

		it('should be able to be instantiated', function() {
			expect(testObject).not.toBe(null);
		});
		describe('"listname" property', function() {
			it('should be "Message"', function() {
				expect(testObject.listName).toBe('Message');
			});
		});
		describe('"initAttributes" method', function() {
			beforeEach(function() {
				testObject.initAttributes();
			});
			it('should populate the properties.', function() {
				expect(testObject.Active).toBeFalsy();
				expect(testObject.AreaId).toBe(3);
				expect(testObject.Body).toBe('still a test');
				expect(testObject.DueDate).toEqual(new Date('2015-02-10T07:00:00Z'));
				expect(testObject.ExpDate).toEqual(new Date('2015-02-10T07:00:00Z'));
				expect(testObject.FromId).toBe(6664);
				expect(testObject.Mandatory).toBeFalsy();
				expect(testObject.Policy).toBeFalsy();
				expect(testObject.SemesterId).toBe(2);
				expect(testObject.Subject).toBe('test4');
				expect(testObject.Recipients).toEqual([]);
				expect(testObject.Area).toEqual({
					Id: 3
				});
				expect(testObject.From).toEqual(new Employee({
					Id: 6664
				}));
				expect(testObject.Semester).toEqual({
					Id: 2
				});
				expect(testObject.UniversalPolicy).toBeFalsy();
				expect(testObject.tempBody).toBe('still a test');
				expect(testObject.Edit).toBeFalsy();
				expect(testObject.Created).toEqual(new Date('2015-02-03T15:17:33Z'));
				expect(testObject.GUID).toBe('8fc974fe-4357-4376-900e-a71aabb9aae9');
				expect(testObject.Id).toBe(3468);
				expect(testObject.Modified).toEqual(new Date('2015-02-05T22:07:47Z'));
				expect(testObject.__metadata).toEqual({
					'id': 'Web/Lists(guid\'d819bc0d-5989-4513-a574-9712e0a1ac4d\')/Items(3468)',
					'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'d819bc0d-5989-4513-a574-9712e0a1ac4d\')/Items(3468)',
					'etag': '"2"',
					'type': 'SP.Data.MessageListItem'
				});
			});
			it('should call the "Autolinker.link()" method.', function() {
				expect(Autolinker.link).toHaveBeenCalled();
			});
			it('should call the "updateData()" method.', function() {
				expect(Message.prototype.updateData).toHaveBeenCalled();
			});
		});
		describe('"updateData" method', function() {
			it('should populate the data property.', function() {
				expect(testObject.data).toEqual({
					__metadata: {
						'id': 'Web/Lists(guid\'d819bc0d-5989-4513-a574-9712e0a1ac4d\')/Items(3468)',
						'uri': 'https://inet.byui.edu/sites/TestingServices/_api/Web/Lists(guid\'d819bc0d-5989-4513-a574-9712e0a1ac4d\')/Items(3468)',
						'etag': '"2"',
						'type': 'SP.Data.MessageListItem'
					},
					Active: false,
					AreaId: 3,
					Body: 'still a test',
					DueDate: new Date('2015-02-10T07:00:00Z'),
					ExpDate: new Date('2015-02-10T07:00:00Z'),
					FromId: 6664,
					Mandatory: false,
					Policy: false,
					SemesterId: 2,
					Subject: 'test4'
				});
			});
		});
		describe('"toString" method', function() {
			it('should call the "Employee.toString()" method if the From property is defined.', function() {
				var result = testObject.toString();
				expect(Employee.prototype.toString).toHaveBeenCalled();
			});
			it('should return the Subject the followed by Employee\'s name if the From property is defined.', function() {
				expect(testObject.toString()).toBe('Subject: test4\n From: New Person');
			});
			it('should return "New Message" if the From is undefined', function() {
				testObject.From = undefined;
				expect(testObject.toString()).toBe('New Message');
			});
		});
		describe('"send" method', function() {
			beforeEach(function() {
				this.tempTestObject1 = new Message({
					Id: 3468,
					Recipients: [{
						Id: 1
					}, {
						Id: 2
					}, {
						Id: 3
					}, {
						Id: 4
					}]
				});
				this.tempTestObject1.send(true);
				$httpBackend.flush();
			});
			it('should call the "add()" method.', function() {
				expect(Message.prototype.add).toHaveBeenCalled();
			});
			it('should create 4 SentMessage object.', function() {
				expect(SentMessage.prototype.initAttributes.callCount).toBe(4);
			});
			it('should call the new SentMessage\'s "add()" method.', function() {
				expect(SentMessage.prototype.add).toHaveBeenCalled();
			})
		});
		describe('"getRecipients" method', function() {
			it('should get all relevant SentMessages.', function() {
				testObject.Recipients = [];
				testObject.getRecipients();
				expect(testObject.Recipients.length).toBe(1);
			});
		});
		describe('"deactivate" method', function() {
			it('should call the "update()" method.', function() {
				testObject.deactivate(true);
				$httpBackend.flush();
				expect(Message.prototype.update).toHaveBeenCalled();
			});
		});
		describe('"add" method', function() {
			beforeEach(function() {
				this.tempTestObject1 = new Message({
					Id: 3468
				});
				Message.prototype.updateData.reset();
				this.tempTestObject1.add(true);
				$httpBackend.flush();
			});
			it('should call the "Data.add()" method.', function() {
				expect(Data.prototype.add).toHaveBeenCalled();
			});
			it('should call the "updateData()" method.', function() {
				expect(Message.prototype.updateData.callCount).toBe(2);
			});
			it('should call the "initAttributes()" method.', function() {
				expect(Message.prototype.initAttributes).toHaveBeenCalled();
			});
			it('should call the "dataService.addItem()" method.', function() {
				expect(dataService.addItem).toHaveBeenCalled();
			});
		});
		describe('"refresh" method', function() {
			beforeEach(function() {
				testObject.refresh(true);
				$httpBackend.flush();
			});
			it('should call the "dataService.fetchItem()" method.', function() {
				expect(dataService.fetchItem).toHaveBeenCalled();
			});
			it('should call the "initAttributes()" method.', function() {
				expect(Message.prototype.initAttributes).toHaveBeenCalled();
			});
		});
		describe('"remove" method', function() {
			beforeEach(function() {
				testObject.remove(true);
				$httpBackend.flush();
			});
			it('should call the "dataService.deleteItem()" method.', function() {
				expect(dataService.deleteItem).toHaveBeenCalled();
			});
			xit('should remove the item from the availabilities list.', function() {});
		});
		describe('"update" method', function() {
			beforeEach(function() {
				Message.prototype.updateData.reset();
				testObject.update(true);
				$httpBackend.flush();
			});
			it('should call the "updateData()" method.', function() {
				expect(Message.prototype.updateData.callCount).toBe(2);
			});
			it('should call the "refresh()" method.', function() {
				expect(Message.prototype.refresh).toHaveBeenCalled();
			});
			it('should call the "dataService.updateItem()" method.', function() {
				expect(dataService.updateItem).toHaveBeenCalled();
			});
		});
	});
})();
